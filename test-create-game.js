// Script to create a test manual Top 10 game for editing
const sequelize = require('./dist/db/connection');
const Best_tens = require('./dist/models/mysql/Best_tens');
const Manual_Best_tens_results = require('./dist/models/mysql/Manual_Best_Tens_Results');
const { v4: uuidv4 } = require('uuid');

async function createTestGame() {
  try {
    console.log('Creating test Top 10 game...');

    // Create a test game
    const gameId = uuidv4();
    const testGame = {
      id: gameId,
      title: 'Test Top 10 Drivers 2023',
      date: '2024-01-15',
      type: 'driver',
      table: 'points',
      creation: 'manual',
    };

    // Create game using Sequelize model
    const createdGame = await Best_tens.create(testGame);
    console.log('Game created with ID:', gameId);

    // Create some test results (we'll use placeholder driver IDs)
    const testResults = [
      { resultID: 'hamilton-lewis', totalStat: 500, position: 1 },
      { resultID: 'verstappen-max', totalStat: 480, position: 2 },
      { resultID: 'leclerc-charles', totalStat: 350, position: 3 },
      { resultID: 'perez-sergio', totalStat: 320, position: 4 },
      { resultID: 'russell-george', totalStat: 300, position: 5 },
      { resultID: 'sainz-carlos', totalStat: 280, position: 6 },
      { resultID: 'norris-lando', totalStat: 250, position: 7 },
      { resultID: 'alonso-fernando', totalStat: 200, position: 8 },
      { resultID: 'ocon-esteban', totalStat: 180, position: 9 },
      { resultID: 'gasly-pierre', totalStat: 150, position: 10 },
    ];

    // Insert into Manual_Best_tens_results table
    for (const result of testResults) {
      const resultData = {
        id: uuidv4(),
        gameid: gameId,
        resultID: result.resultID,
        totalStat: result.totalStat,
        position: result.position,
      };

      await Manual_Best_tens_results.create(resultData);
    }

    console.log('Test game and results created successfully!');
    console.log('Game ID for testing:', gameId);

  } catch (error) {
    console.error('Error creating test game:', error);
  } finally {
    process.exit(0);
  }
}

createTestGame();