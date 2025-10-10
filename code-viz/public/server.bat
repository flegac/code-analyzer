@echo off
REM Démarre un serveur HTTP sur le port 8000 dans le dossier courant

echo Starting HTTP server on port 8000...
python -m http.server 8000

pause
