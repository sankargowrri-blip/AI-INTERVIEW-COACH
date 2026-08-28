from typing import List
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_companies():
    # Return a list of supported companies with more detail
    return [
        {"id": 1, "name": "Google", "industry": "Tech", "logo": "google_logo_url"},
        {"id": 2, "name": "Amazon", "industry": "E-commerce/Tech", "logo": "amazon_logo_url"},
        {"id": 3, "name": "Meta", "industry": "Social Media", "logo": "meta_logo_url"},
        {"id": 4, "name": "Apple", "industry": "Consumer Electronics", "logo": "apple_logo_url"},
        {"id": 5, "name": "Microsoft", "industry": "Software", "logo": "microsoft_logo_url"}
    ]
