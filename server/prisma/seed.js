const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const memberPassword = await bcrypt.hash('Member@123', 12);

  // 1. Create Users via Upsert
  const alex = await prisma.user.upsert({
    where: { email: 'admin@taskflow.com' },
    update: {},
    create: { name: 'Alex Admin', email: 'admin@taskflow.com', passwordHash: adminPassword, role: 'ADMIN' },
  });
  const sara = await prisma.user.upsert({
    where: { email: 'sara@taskflow.com' },
    update: {},
    create: { name: 'Sara Smith', email: 'sara@taskflow.com', passwordHash: adminPassword, role: 'ADMIN' },
  });
  const john = await prisma.user.upsert({
    where: { email: 'john@taskflow.com' },
    update: {},
    create: { name: 'John Dev', email: 'john@taskflow.com', passwordHash: memberPassword, role: 'MEMBER' },
  });
  const priya = await prisma.user.upsert({
    where: { email: 'priya@taskflow.com' },
    update: {},
    create: { name: 'Priya Design', email: 'priya@taskflow.com', passwordHash: memberPassword, role: 'MEMBER' },
  });
  const ravi = await prisma.user.upsert({
    where: { email: 'ravi@taskflow.com' },
    update: {},
    create: { name: 'Ravi QA', email: 'ravi@taskflow.com', passwordHash: memberPassword, role: 'MEMBER' },
  });

  console.log('Users seeded.');

  // 2. Create Projects via Upsert
  const ecommerce = await prisma.project.upsert({
    where: { id: 'seed-ecommerce' },
    update: {},
    create: {
      id: 'seed-ecommerce',
      name: 'E-Commerce Platform',
      description: 'Building the new scalable e-commerce storefront.',
      colorTag: '#6366f1', // indigo
      status: 'ACTIVE',
      members: {
        create: [
          { userId: alex.id, role: 'ADMIN' },
          { userId: john.id, role: 'MEMBER' },
          { userId: priya.id, role: 'MEMBER' },
        ]
      }
    }
  });

  const mobileApp = await prisma.project.upsert({
    where: { id: 'seed-mobile' },
    update: {},
    create: {
      id: 'seed-mobile',
      name: 'Mobile App Redesign',
      description: 'Overhauling the iOS and Android applications.',
      colorTag: '#f59e0b', // amber
      status: 'ACTIVE',
      members: {
        create: [
          { userId: sara.id, role: 'ADMIN' },
          { userId: priya.id, role: 'MEMBER' },
          { userId: ravi.id, role: 'MEMBER' },
        ]
      }
    }
  });

  const internalDash = await prisma.project.upsert({
    where: { id: 'seed-internal' },
    update: {},
    create: {
      id: 'seed-internal',
      name: 'Internal Dashboard',
      description: 'Admin panel for customer support team.',
      colorTag: '#10b981', // emerald
      status: 'COMPLETED',
      members: {
        create: [
          { userId: alex.id, role: 'ADMIN' },
          { userId: john.id, role: 'MEMBER' },
          { userId: ravi.id, role: 'MEMBER' },
        ]
      }
    }
  });

  console.log('Projects seeded.');

  // 3. Create Tasks
  // We'll just create them directly, ignoring if they exist for simplicity, or we can clear existing seed tasks first.
  // To make it idempotent, we'll clear tasks associated with these seed projects first.
  await prisma.task.deleteMany({
    where: { projectId: { in: [ecommerce.id, mobileApp.id, internalDash.id] } }
  });

  // Date helpers
  const today = new Date();
  const pastDate = new Date(today); pastDate.setDate(today.getDate() - 3);
  const futureDate = new Date(today); futureDate.setDate(today.getDate() + 5);

  const tasksData = [
    // E-commerce
    { title: 'Design Homepage Mockups', status: 'DONE', priority: 'HIGH', projectId: ecommerce.id, creatorId: alex.id, assigneeId: priya.id, dueDate: pastDate },
    { title: 'Setup Stripe Integration', status: 'IN_PROGRESS', priority: 'CRITICAL', projectId: ecommerce.id, creatorId: alex.id, assigneeId: john.id, dueDate: today },
    { title: 'Write Product API endpoints', status: 'TODO', priority: 'MEDIUM', projectId: ecommerce.id, creatorId: john.id, assigneeId: john.id, dueDate: futureDate },
    { title: 'Cart State Management', status: 'TODO', priority: 'HIGH', projectId: ecommerce.id, creatorId: alex.id, assigneeId: john.id, dueDate: pastDate }, // Overdue
    // Mobile App
    { title: 'Update React Native Version', status: 'DONE', priority: 'MEDIUM', projectId: mobileApp.id, creatorId: sara.id, assigneeId: priya.id },
    { title: 'Redesign Settings Screen', status: 'IN_PROGRESS', priority: 'MEDIUM', projectId: mobileApp.id, creatorId: sara.id, assigneeId: priya.id, dueDate: futureDate },
    { title: 'Fix Android Push Notifications', status: 'TODO', priority: 'CRITICAL', projectId: mobileApp.id, creatorId: ravi.id, assigneeId: ravi.id, dueDate: pastDate }, // Overdue
    { title: 'Create App Store Screenshots', status: 'TODO', priority: 'LOW', projectId: mobileApp.id, creatorId: sara.id, assigneeId: priya.id, dueDate: futureDate },
    // Internal Dashboard
    { title: 'User Roles Middleware', status: 'DONE', priority: 'HIGH', projectId: internalDash.id, creatorId: alex.id, assigneeId: john.id, dueDate: pastDate },
    { title: 'Data Export to CSV', status: 'DONE', priority: 'MEDIUM', projectId: internalDash.id, creatorId: john.id, assigneeId: john.id },
    { title: 'Write E2E Tests', status: 'DONE', priority: 'MEDIUM', projectId: internalDash.id, creatorId: ravi.id, assigneeId: ravi.id, dueDate: pastDate },
    { title: 'Deploy to Production', status: 'DONE', priority: 'CRITICAL', projectId: internalDash.id, creatorId: alex.id, assigneeId: alex.id, dueDate: pastDate },
  ];

  await prisma.task.createMany({ data: tasksData });
  console.log('Tasks seeded.');

  // 4. Create Activity Logs
  await prisma.activity.deleteMany({
    where: { projectId: { in: [ecommerce.id, mobileApp.id, internalDash.id] } }
  });

  const activities = [
    { action: 'PROJECT_CREATED', entityType: 'PROJECT', entityId: ecommerce.id, userId: alex.id, projectId: ecommerce.id },
    { action: 'TASK_CREATED', entityType: 'TASK', entityId: 'mock-id-1', userId: alex.id, projectId: ecommerce.id },
    { action: 'TASK_UPDATED', entityType: 'TASK', entityId: 'mock-id-2', userId: john.id, projectId: ecommerce.id },
    { action: 'PROJECT_CREATED', entityType: 'PROJECT', entityId: mobileApp.id, userId: sara.id, projectId: mobileApp.id },
    { action: 'MEMBER_ADDED', entityType: 'PROJECT', entityId: mobileApp.id, userId: sara.id, projectId: mobileApp.id },
    { action: 'TASK_COMPLETED', entityType: 'TASK', entityId: 'mock-id-3', userId: priya.id, projectId: mobileApp.id },
  ];

  await prisma.activity.createMany({ data: activities });
  console.log('Activities seeded.');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
