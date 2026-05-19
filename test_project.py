import pytest
from project import format_duration, is_allowed_url, sanitize_filename


# --- format_duration ---

def test_format_duration_minutes_seconds():
    assert format_duration(213) == "3:33"

def test_format_duration_hours():
    assert format_duration(3661) == "1:01:01"

def test_format_duration_zero():
    assert format_duration(0) == "0:00"

def test_format_duration_exact_minute():
    assert format_duration(60) == "1:00"

def test_format_duration_negative():
    assert format_duration(-5) == "0:00"


# --- is_allowed_url ---

def test_is_allowed_url_youtube():
    assert is_allowed_url("https://youtube.com/watch?v=abc") is True

def test_is_allowed_url_youtu_be():
    assert is_allowed_url("https://youtu.be/abc123") is True

def test_is_allowed_url_fake_domain():
    assert is_allowed_url("https://fakeyoutube.com/watch?v=abc") is False

def test_is_allowed_url_empty():
    assert is_allowed_url("") is False

def test_is_allowed_url_custom_domain():
    assert is_allowed_url("https://example.com", ["example.com"]) is True


# --- sanitize_filename ---

def test_sanitize_filename_removes_invalid_chars():
    assert sanitize_filename('My Video: "Best" One?') == "My Video Best One"

def sanitize_filename_collapses_spaces():
    assert sanitize_filename("Hello     World") == "Hello World"

def test_sanitize_filename_empty():
    assert sanitize_filename("") == "download"

def test_sanitize_filename_normal():
    assert sanitize_filename("Rick Asley - Never Gonna Give You Up") == "Rick Assley - Never Gonna Give You Up"

def test_sanitize_filename_only_invalid_chars():
    assert sanitize_filename('???///') == "download"