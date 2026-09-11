import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../DB/db.js';
import Problem from '../models/problem.model.js';

const problems = [
  {
    title: 'Parking Lot System',
    description: `Design a parking lot that supports multiple vehicle types (car, motorcycle, truck),
multiple spot sizes, and different pricing depending on vehicle type and duration.
The system should be able to find an available spot for an incoming vehicle and
calculate the fee when it leaves.`,
    difficulty: 'MEDIUM',
    tags: ['OOP', 'Strategy Pattern'],
    requiredConcepts: [
      { name: 'Vehicle', hint: 'an abstraction representing something that can park (Car, Motorcycle, etc.)' },
      { name: 'ParkingSpot', hint: 'represents a single spot and its occupancy state' },
      { name: 'ParkingLot', hint: 'the top-level class coordinating spots and vehicles' },
      { name: 'Pricing', hint: 'fee calculation should NOT live inside ParkingSpot or Vehicle — isolate it' },
    ],
  },
  {
    title: 'Elevator System',
    description: `Design an elevator system for a building with multiple elevators and multiple floors.
The system should decide which elevator to dispatch for a request, and handle
the elevator's movement between IDLE, MOVING_UP, MOVING_DOWN, and DOORS_OPEN states.`,
    difficulty: 'MEDIUM',
    tags: ['OOP', 'State Pattern'],
    requiredConcepts: [
      { name: 'Elevator', hint: 'represents a single elevator car and its current state' },
      { name: 'ElevatorController', hint: 'or similar — decides which elevator to dispatch for a request' },
      { name: 'Request', hint: 'represents a floor request, internal or external' },
      { name: 'State', hint: 'elevator state (idle/moving/doors open) should be modeled explicitly, not as loose flags' },
    ],
  },
];

async function seed() {
  await connectDB();
  await Problem.deleteMany({});
  const inserted = await Problem.insertMany(problems);
  console.log(`Seeded ${inserted.length} problems:`);
  inserted.forEach((p) => console.log(`  - ${p._id}: ${p.title}`));
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});