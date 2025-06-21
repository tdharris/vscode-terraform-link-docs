import path from 'node:path';
import * as fs from 'node:fs';
import Mocha from 'mocha';

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c, e) => {
		try {
			// Get the list of test files
			const files = findTestFiles(testsRoot);

			// Add files to the test suite
			files.forEach((f: string) => mocha.addFile(f));

			// Run the mocha test
			mocha.run(failures => {
				if (failures > 0) {
					e(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		} catch (err) {
			console.error(err);
			e(err);
		}
	});
}

/**
 * Recursively finds all test files in a directory
 * @param dir directory to search
 * @param fileList array to accumulate matching files
 * @returns array of test file paths
 */
function findTestFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTestFiles(filePath, fileList);
    } else if (file.endsWith('.test.js')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}
