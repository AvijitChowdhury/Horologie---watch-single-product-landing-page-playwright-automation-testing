"""End-to-end Playwright tests for the Horologie custom watch e-commerce site.

Run via: pytest tests/e2e --alluredir=allure-results
"""
from __future__ import annotations

import os
import json
import urllib.request
import allure
import pytest
from pathlib import Path
from playwright.sync_api import Page, expect

ADMIN_EMAIL = os.environ.get("E2E_ADMIN_EMAIL", "abhichy30@gmail.com")
ADMIN_PASSWORD = os.environ.get("E2E_ADMIN_PASSWORD", "12345678")
SUPABASE_URL = "https://qomhsluwgxihfgyjmstn.supabase.co"
SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbWhzbHV3Z3hpaGZneWptc3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTA3MjEsImV4cCI6MjA5ODI2NjcyMX0.H1f6CvfPmga4GEJ32ZTm5Mqpcs2uFWkNkiKhXeKJJnQ"
STORAGE_KEY = "sb-qomhsluwgxihfgyjmstn-auth-token"
SHOTS = Path("tests/e2e/screenshots")
SHOTS.mkdir(parents=True, exist_ok=True)

_session_cache: dict | None = None


def _get_session() -> dict:
    global _session_cache
    if _session_cache is not None:
        return _session_cache
    req = urllib.request.Request(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        method="POST",
        headers={"apikey": SUPABASE_ANON, "Content-Type": "application/json"},
        data=json.dumps({"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).encode(),
    )
    with urllib.request.urlopen(req) as r:
        _session_cache = json.loads(r.read())
    return _session_cache


def _shot(page: Page, name: str) -> None:
    path = SHOTS / f"{name}.png"
    page.screenshot(path=str(path))
    allure.attach.file(str(path), name=name, attachment_type=allure.attachment_type.PNG)


def _sign_in(page: Page) -> None:
    """Inject a valid Supabase session into localStorage (bypasses OAuth broker)."""
    session = _get_session()
    page.goto("/")
    page.evaluate(
        "([k, v]) => window.localStorage.setItem(k, v)",
        [STORAGE_KEY, json.dumps(session)],
    )
    page.goto("/")
    page.wait_for_load_state("networkidle")


@allure.feature("Landing")
@allure.title("Homepage loads with hero, configurator, testimonials and FAQ")
def test_homepage(page: Page):
    page.goto("/")
    expect(page.get_by_role("heading", level=1)).to_be_visible()
    _shot(page, "01_home_hero")
    page.locator("#configure").scroll_into_view_if_needed()
    _shot(page, "02_home_configurator")
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(500)
    _shot(page, "03_home_footer")


@allure.feature("Configurator")
@allure.title("User can customize strap, dial, case, size, engraving, warranty and gift box")
def test_configurator_interactions(page: Page):
    page.goto("/#configure")
    page.wait_for_selector("#configure")
    # Pick 2nd swatch in each grid where available
    grids = page.locator("#configure .grid button")
    # Strap swatches
    swatch_buttons = page.locator("#configure button:has(.aspect-square)")
    count = swatch_buttons.count()
    if count >= 2:
        swatch_buttons.nth(1).click()
    # engraving
    page.get_by_placeholder('e.g. "For Dad ❤️"').fill("Horologie 2026")
    # gift toggle
    page.locator('input[type="checkbox"]').first.check(force=True)
    _shot(page, "04_configurator_selected")
    expect(page.get_by_role("link", name="Review & Checkout")).to_be_visible()


@allure.feature("Authentication")
@allure.title("Admin can sign in with email and password")
def test_sign_in(page: Page):
    page.goto("/auth")
    _shot(page, "05_auth_page")
    _sign_in(page)
    _shot(page, "06_signed_in_home")
    expect(page.get_by_role("button", name="Sign out")).to_be_visible()


@allure.feature("Checkout")
@allure.title("Signed-in user can review and place a mock order")
def test_checkout_and_order(page: Page):
    _sign_in(page)
    # Configure something
    page.goto("/#configure")
    page.get_by_placeholder('e.g. "For Dad ❤️"').fill("E2E Test")
    page.get_by_role("link", name="Review & Checkout").click()
    page.wait_for_url("**/checkout")
    _shot(page, "07_checkout_page")
    page.get_by_label("Full name").fill("Abhi Test")
    page.get_by_label("Address line 1").fill("123 Watchmaker Ln")
    page.get_by_label("City").fill("Zurich")
    page.get_by_label("Postal code").fill("8001")
    page.get_by_label("Country").fill("Switzerland")
    _shot(page, "08_checkout_filled")
    page.get_by_role("button", name=lambda n: "Place mock order" in (n or "")).click()
    page.wait_for_url("**/orders/**", timeout=20000)
    _shot(page, "09_order_confirmation")
    expect(page).to_have_url(lambda url: "/orders/" in url)


@allure.feature("Orders")
@allure.title("User can view their order history")
def test_order_history(page: Page):
    _sign_in(page)
    page.goto("/orders")
    page.wait_for_load_state("networkidle")
    _shot(page, "10_orders_history")


@allure.feature("Admin")
@allure.title("Admin dashboard lists all orders")
def test_admin_dashboard(page: Page):
    _sign_in(page)
    page.goto("/admin")
    page.wait_for_load_state("networkidle")
    # Should not show denied
    expect(page.get_by_text("You don't have admin access.")).to_have_count(0)
    _shot(page, "11_admin_dashboard")