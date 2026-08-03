# Script para borar todos los target y ficheos de eclipse de forma recursiva desde el  directorio actual

find . -type d -name "target" -print -exec rm -rf {} +
find . -type f -name "*.launch" -print -exec rm -rf {} +
find . -type f -name ".classpath" -print -exec rm -f {} + 
find . -type f -name ".project" -print -exec rm -f {} +
find . -type d -name ".settings" -print -exec rm -rf {} +

