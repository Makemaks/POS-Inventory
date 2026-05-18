@echo off
cd /d C:\xampp\htdocs\POS-Inventory

echo Starting POS Inventory...

REM Open the HTML landing page first
start "" "C:\xampp\htdocs\POS-Inventory\RVRYeb\index.html"

REM Run backend
start "POS Backend" cmd /k "cd /d C:\xampp\htdocs\POS-Inventory\my-backend && node index.js"

REM Run seeder only once
if not exist ".first-run-done" (
    echo First run detected. Running seeder...
    cd /d C:\xampp\htdocs\POS-Inventory\my-backend
    node seeder\seeder.js

    cd /d C:\xampp\htdocs\POS-Inventory
    echo Seeder already ran > .first-run-done
) else (
    echo Seeder already ran before. Skipping seeder...
)

REM Run frontend
start "POS Frontend" cmd /k "cd /d C:\xampp\htdocs\POS-Inventory\my-frontend && npm start"

echo Done.
pause