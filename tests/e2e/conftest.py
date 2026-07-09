import os
import pytest

BASE_URL = os.environ.get("E2E_BASE_URL", "http://localhost:8080")


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "viewport": {"width": 1280, "height": 1800},
        "base_url": BASE_URL,
    }


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture()
def screenshots_dir(tmp_path_factory):
    d = tmp_path_factory.mktemp("shots")
    return d