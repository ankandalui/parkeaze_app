console.log("Hello..");

const positions = [6, 9];

console.log(positions);

[positions[0], positions[1]] = [positions[1], positions[0]];

console.log(positions); // Output will be [9, 6]
