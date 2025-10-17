from fastapi import FastAPI

app = FastAPI(
    title="AssetForge - Inventory Service",
    description="API para gerenciamento de ativos de TI.",
    version="0.1.0"
)

@app.get("/")
def read_root():
    """ Endpoint raiz para verificar se a API está no ar. """
    return {"message": "Inventory Service is alive!"}