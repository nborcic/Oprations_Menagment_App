import { PrismaClient, Role, JobStatus, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@somp.com' },
    update: {},
    create: {
      email: 'admin@somp.com',
      password: adminPassword,
      name: 'Alex Admin',
      role: Role.ADMIN,
    },
  });

  const staff1 = await prisma.user.upsert({
    where: { email: 'john@somp.com' },
    update: {},
    create: {
      email: 'john@somp.com',
      password: staffPassword,
      name: 'John Rivera',
      role: Role.STAFF,
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: 'maria@somp.com' },
    update: {},
    create: {
      email: 'maria@somp.com',
      password: staffPassword,
      name: 'Maria Chen',
      role: Role.STAFF,
    },
  });

  const staff3 = await prisma.user.upsert({
    where: { email: 'david@somp.com' },
    update: {},
    create: {
      email: 'david@somp.com',
      password: staffPassword,
      name: 'David Park',
      role: Role.STAFF,
    },
  });

  // Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Harborview Apartments',
        email: 'manager@harborview.com',
        phone: '(305) 555-0101',
        address: '1200 Harbor Blvd, Miami, FL 33101',
        notes: 'Large complex — 120 units. Contact Karen for access.',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sunset Marina',
        email: 'ops@sunsetmarina.com',
        phone: '(305) 555-0182',
        address: '88 Marina Way, Fort Lauderdale, FL 33301',
        notes: 'Boat service client. Gate code: 4421.',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Pelican Bay Resort',
        email: 'facilities@pelicanbay.com',
        phone: '(305) 555-0243',
        address: '500 Ocean Drive, Miami Beach, FL 33139',
        notes: 'VIP client. Always confirm appointment 24h in advance.',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Greenfield Office Park',
        email: 'admin@greenfieldop.com',
        phone: '(305) 555-0374',
        address: '3300 Business Center Dr, Doral, FL 33166',
        notes: 'Electrical maintenance only. After-hours access permitted.',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'The Whitmore Hotel',
        email: 'engineering@whitmore.com',
        phone: '(305) 555-0415',
        address: '720 Brickell Ave, Miami, FL 33131',
        notes: 'Premium hospitality client. All work must be coordinated with GM.',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Coastal Cleaning Co.',
        email: 'info@coastalcleaning.com',
        phone: '(786) 555-0561',
        address: '145 NW 2nd Ave, Miami, FL 33128',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Rodriguez Family Residence',
        email: 'carlos.r@email.com',
        phone: '(786) 555-0637',
        address: '2847 Coral Way, Miami, FL 33145',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Bayfront Tech Campus',
        email: 'facilities@bayfronttech.io',
        phone: '(305) 555-0788',
        address: '1 Innovation Blvd, Miami, FL 33132',
        notes: 'New client since Jan 2024. Security badge required.',
      },
    }),
  ]);

  const [harborview, sunsetMarina, pelicanBay, greenfield, whitmore, coastal, rodriguez, bayfront] = customers;

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

  // Jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Unit 4B — Plumbing Leak Repair',
      description: 'Resident reported water leaking under kitchen sink. Check supply line and P-trap. Replace if needed.',
      status: JobStatus.COMPLETED,
      priority: Priority.HIGH,
      scheduledDate: daysAgo(10),
      completedDate: daysAgo(9),
      customerId: harborview.id,
      assignedToId: staff1.id,
      createdById: admin.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Marina Slip C12 — Bilge Pump Service',
      description: 'Annual bilge pump inspection and maintenance for vessel in slip C12. Check electrical connections.',
      status: JobStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      scheduledDate: daysFromNow(1),
      customerId: sunsetMarina.id,
      assignedToId: staff2.id,
      createdById: admin.id,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'Pool Equipment Room — Electrical Panel Inspection',
      description: 'Annual inspection of pool electrical panel. Check GFCI breakers, verify grounding.',
      status: JobStatus.OVERDUE,
      priority: Priority.URGENT,
      scheduledDate: daysAgo(5),
      customerId: pelicanBay.id,
      assignedToId: staff3.id,
      createdById: admin.id,
    },
  });

  const job4 = await prisma.job.create({
    data: {
      title: 'Suite 200 — HVAC Filter Replacement',
      description: 'Replace all HVAC filters in Suite 200. 4 units total. Filters on-site.',
      status: JobStatus.OPEN,
      priority: Priority.LOW,
      scheduledDate: daysFromNow(7),
      customerId: greenfield.id,
      assignedToId: staff1.id,
      createdById: staff2.id,
    },
  });

  const job5 = await prisma.job.create({
    data: {
      title: 'Lobby Lighting — LED Retrofit',
      description: 'Replace existing lobby lighting with LED fixtures. 24 fixtures total. Materials delivered.',
      status: JobStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      scheduledDate: daysAgo(2),
      customerId: whitmore.id,
      assignedToId: staff3.id,
      createdById: admin.id,
    },
  });

  const job6 = await prisma.job.create({
    data: {
      title: 'Monthly Deep Clean — Office Floors 1-3',
      description: 'Full deep clean of office floors 1, 2, and 3. Include carpet extraction in conference rooms.',
      status: JobStatus.OPEN,
      priority: Priority.MEDIUM,
      scheduledDate: daysFromNow(3),
      customerId: coastal.id,
      createdById: staff2.id,
    },
  });

  const job7 = await prisma.job.create({
    data: {
      title: 'Bathroom Renovation — Phase 1',
      description: 'Replace master bathroom vanity, re-tile shower walls, install new fixtures.',
      status: JobStatus.OPEN,
      priority: Priority.MEDIUM,
      scheduledDate: daysFromNow(14),
      customerId: rodriguez.id,
      assignedToId: staff1.id,
      createdById: admin.id,
    },
  });

  const job8 = await prisma.job.create({
    data: {
      title: 'Server Room — Cooling System Check',
      description: 'Inspect and service precision cooling units in server room. Check for refrigerant leaks.',
      status: JobStatus.COMPLETED,
      priority: Priority.URGENT,
      scheduledDate: daysAgo(15),
      completedDate: daysAgo(14),
      customerId: bayfront.id,
      assignedToId: staff2.id,
      createdById: admin.id,
    },
  });

  const job9 = await prisma.job.create({
    data: {
      title: 'Unit 12A — AC Not Cooling',
      description: 'Resident reports AC unit running but not cooling. Check refrigerant levels and coils.',
      status: JobStatus.OVERDUE,
      priority: Priority.HIGH,
      scheduledDate: daysAgo(3),
      customerId: harborview.id,
      assignedToId: staff3.id,
      createdById: staff2.id,
    },
  });

  const job10 = await prisma.job.create({
    data: {
      title: 'Dock Lighting — Repair Faulty Fixtures',
      description: 'Three dock lights on pier B are flickering or out entirely. Inspect wiring and replace fixtures.',
      status: JobStatus.OPEN,
      priority: Priority.HIGH,
      scheduledDate: daysFromNow(5),
      customerId: sunsetMarina.id,
      assignedToId: staff1.id,
      createdById: admin.id,
    },
  });

  // Notes
  await prisma.note.createMany({
    data: [
      {
        content: 'Replaced supply line and P-trap. Tested — no leaks. Resident satisfied.',
        jobId: job1.id,
        authorId: staff1.id,
      },
      {
        content: 'Parts sourced from Home Depot. Total material cost: $47.',
        jobId: job1.id,
        authorId: staff1.id,
      },
      {
        content: 'Started bilge pump teardown. Motor bearings worn — ordered replacement. ETA tomorrow.',
        jobId: job2.id,
        authorId: staff2.id,
      },
      {
        content: 'Panel has two tripped GFCI breakers. Needs immediate attention — flagged as urgent.',
        jobId: job3.id,
        authorId: staff3.id,
      },
      {
        content: 'Client was unavailable on scheduled date. Need to reschedule ASAP.',
        jobId: job3.id,
        authorId: admin.id,
      },
      {
        content: 'Completed floors 1 and 2. Floor 3 and lobby pending. Back tomorrow to finish.',
        jobId: job5.id,
        authorId: staff3.id,
      },
      {
        content: 'Cooling units operating within spec. Refrigerant levels nominal. No leaks detected.',
        jobId: job8.id,
        authorId: staff2.id,
      },
      {
        content: 'Cleaned condensate drain lines as preventive measure. Left maintenance report on-site.',
        jobId: job8.id,
        authorId: staff2.id,
      },
      {
        content: 'Checked unit — refrigerant is low. Need to source R-410A. Will return when parts arrive.',
        jobId: job9.id,
        authorId: staff3.id,
      },
    ],
  });

  // Activity logs
  const logEntries = [
    { action: 'JOB_CREATED', entityType: 'Job', entityId: job1.id, userId: admin.id, jobId: job1.id, metadata: { title: job1.title } },
    { action: 'JOB_STATUS_CHANGED', entityType: 'Job', entityId: job1.id, userId: staff1.id, jobId: job1.id, metadata: { from: 'OPEN', to: 'COMPLETED' } },
    { action: 'NOTE_ADDED', entityType: 'Note', entityId: job1.id, userId: staff1.id, jobId: job1.id, metadata: { preview: 'Replaced supply line...' } },
    { action: 'JOB_CREATED', entityType: 'Job', entityId: job2.id, userId: admin.id, jobId: job2.id, metadata: { title: job2.title } },
    { action: 'JOB_ASSIGNED', entityType: 'Job', entityId: job2.id, userId: admin.id, jobId: job2.id, metadata: { assignedTo: 'Maria Chen' } },
    { action: 'JOB_STATUS_CHANGED', entityType: 'Job', entityId: job2.id, userId: staff2.id, jobId: job2.id, metadata: { from: 'OPEN', to: 'IN_PROGRESS' } },
    { action: 'JOB_CREATED', entityType: 'Job', entityId: job3.id, userId: admin.id, jobId: job3.id, metadata: { title: job3.title } },
    { action: 'JOB_CREATED', entityType: 'Job', entityId: job5.id, userId: admin.id, jobId: job5.id, metadata: { title: job5.title } },
    { action: 'NOTE_ADDED', entityType: 'Note', entityId: job5.id, userId: staff3.id, jobId: job5.id, metadata: { preview: 'Completed floors 1 and 2...' } },
    { action: 'CUSTOMER_CREATED', entityType: 'Customer', entityId: bayfront.id, userId: admin.id, jobId: null, metadata: { name: 'Bayfront Tech Campus' } },
    { action: 'JOB_CREATED', entityType: 'Job', entityId: job8.id, userId: admin.id, jobId: job8.id, metadata: { title: job8.title } },
    { action: 'JOB_STATUS_CHANGED', entityType: 'Job', entityId: job8.id, userId: staff2.id, jobId: job8.id, metadata: { from: 'IN_PROGRESS', to: 'COMPLETED' } },
  ];

  for (const entry of logEntries) {
    await prisma.activityLog.create({ data: entry });
  }

  console.log('Seed complete.');
  console.log('\nDemo accounts:');
  console.log('  Admin:  admin@somp.com  / admin123');
  console.log('  Staff:  john@somp.com   / staff123');
  console.log('  Staff:  maria@somp.com  / staff123');
  console.log('  Staff:  david@somp.com  / staff123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
