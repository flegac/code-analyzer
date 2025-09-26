
export class ParserService {
    extractImports(source) {
        const importRegex = /import\s+(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g;
        const dynamicImportRegex = /import\(\s*["']([^"']+)["']\s*\)/g;

        const imports = new Set();
        let match;

        // Match static imports
        while ((match = importRegex.exec(source)) !== null) {
            imports.add(match[1]);
        }

        // Match dynamic imports
        while ((match = dynamicImportRegex.exec(source)) !== null) {
            imports.add(match[1]);
        }

        return Array.from(imports);
    }
}