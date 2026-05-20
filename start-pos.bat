@echo off
cd /d C:\xampp\htdocs\POS-Inventory

echo Starting POS Inventory...

start "" "C:\xampp\htdocs\POS-Inventory\RVRYeb\index.html"

if not exist ".first-run-done" (
    echo First run detected. Running seeder...
    cd /d C:\xampp\htdocs\POS-Inventory\my-backend
    node seeder\seeder.js

    if errorlevel 1 (
        echo Seeder failed. First-run flag was NOT created.
        pause
        exit /b 1
    )

    cd /d C:\xampp\htdocs\POS-Inventory
    echo Seeder already ran > .first-run-done
) else (
    echo Seeder already ran before. Skipping seeder...
)

start "POS Backend" cmd /k "cd /d C:\xampp\htdocs\POS-Inventory\my-backend && node index.js"

start "POS Frontend" cmd /k "cd /d C:\xampp\htdocs\POS-Inventory\my-frontend && npm start"

echo Done.
pause