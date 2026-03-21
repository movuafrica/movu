FROM python:3.12-slim

# Keep runtime lean by default; install heavy OCR/office tools only when needed.
ARG INSTALL_HEAVY_DOC_TOOLS=false

RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    libmagic1 \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN if [ "$INSTALL_HEAVY_DOC_TOOLS" = "true" ]; then \
    apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*; \
    fi

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

# Directories that will typically be volume-mounted in production
RUN mkdir -p docs .cache dbv1/chroma_db

EXPOSE 8000
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
