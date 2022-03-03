/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
// import axios from 'axios';
// import { v4 as uuidv4 } from 'uuid';

export function main(board: string[][], word: string, print = false): boolean {
	// invalid board
	if (!board.length || !board[0].length) {
		return false;
	}

	// empty word
	if (!word || !word.length) {
		return false;
	}

	const yDimensions = board.length;
	const xDimensions = board[0].length;

	// too long word
	if (word.length > (board.length * board[0].length)) {
		return false;
	}

	// y first for better visualization of the 2d array
	for (let y = 0; y < yDimensions; y++) {
		for (let x = 0; x < xDimensions; x++) {
			// recurse on each staring letter
			if (word[0] === board[y][x]) {
				const visited = createEmptyVisitedBoard(xDimensions, yDimensions);
				visited[y][x] = true;
				const hasWord = boggleDepthFirstSearch(board, x, y, xDimensions, yDimensions, word.slice(1), visited, print);
				if (hasWord) {
					return true;
				}
			}
		}
	}

	return false;
}

export function boggleDepthFirstSearch(board: string[][], x: number, y: number, xDimensions: number, yDimensions: number, word: string, visited: boolean[][], print: boolean): boolean {
	if (print) {
		console.log(`x:${x}, y:${y}, word: ${word}, visited: \n${stringifyVisited(visited)}`);
	}

	if (!word.length) {
		return true;
	}

	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			const currentPointerX = x + j;
			const currentPointerY = y + i;
	
			// continue if out of bounds or visited
			if (outOfBounds(currentPointerX, currentPointerY, xDimensions, yDimensions) || visited[currentPointerY][currentPointerX]) {
				continue;
			}

			// console.log(`Here ${currentPointerX}, ${currentPointerY}, ${word[0]}`);
			if (board[currentPointerY][currentPointerX] === word[0]) {
				visited[currentPointerY][currentPointerX] = true;
				const result = boggleDepthFirstSearch(board, currentPointerX, currentPointerY, xDimensions, yDimensions, word.slice(1), visited, print);
				if (result) {
					return true;
				}
				visited[currentPointerY][currentPointerX] = false;
			}
		}
	}

	return false;
}

export function outOfBounds(x: number, y: number, xDimensions: number, yDimensions: number): boolean {
	return x >= xDimensions || y >= yDimensions || x < 0 || y < 0;
}

export function createEmptyVisitedBoard(xDimensions: number, yDimensions: number): boolean[][] {
	const visited: boolean[][] = [];
	for (let y = 0; y < yDimensions; y++) {
		visited.push([]);
		for (let x = 0; x < xDimensions; x++) {
			visited[y].push(false);
		}
	}
	return visited;
}

function stringifyVisited(visited: boolean[][]): string {
	return visited.reduce((acc, row) => (
		acc += `\n[${row.reduce((rowAcc, bool) => (rowAcc += bool ? 'X' : ' '), '')}]`
	), '');
}