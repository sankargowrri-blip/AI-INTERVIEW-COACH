import os
import shutil
from pathlib import Path
from typing import Union

def save_upload_file(upload_file, destination: Union[str, Path]) -> None:
    """Saves an uploaded file to a destination."""
    try:
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()

def delete_file(path: Union[str, Path]) -> None:
    """Deletes a file if it exists."""
    if os.path.exists(path):
        os.remove(path)

def ensure_dir(path: Union[str, Path]) -> None:
    """Ensures a directory exists."""
    os.makedirs(path, exist_ok=True)
