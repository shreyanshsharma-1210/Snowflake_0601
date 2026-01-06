// Mock data for doctor appointment system

export const MOCK_SPECIALTIES = [
    { id: 1, name: 'Cardiology' },
    { id: 2, name: 'Dermatology' },
    { id: 3, name: 'Pediatrics' },
    { id: 4, name: 'Orthopedics' },
    { id: 5, name: 'Neurology' },
    { id: 6, name: 'General Practice' },
];

export const MOCK_DOCTORS = [
    {
        id: 1,
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        phone: '+91 98765 43210',
        specialty: 'Cardiology',
        specialtyId: 1,
    },
    {
        id: 2,
        name: 'Dr. Michael Chen',
        email: 'michael.chen@hospital.com',
        phone: '+91 98765 43211',
        specialty: 'Dermatology',
        specialtyId: 2,
    },
    {
        id: 3,
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@hospital.com',
        phone: '+91 98765 43212',
        specialty: 'Pediatrics',
        specialtyId: 3,
    },
];

export const MOCK_PATIENTS = [
    {
        id: 1,
        name: 'Aditya Kumrawat',
        email: 'aditya@example.com',
        phone: '+91 70000 00001',
        address: 'Indore, Madhya Pradesh',
        dob: '1995-05-15',
    },
    {
        id: 2,
        name: 'Ravi Patel',
        email: 'ravi@example.com',
        phone: '+91 70000 00002',
        address: 'Mumbai, Maharashtra',
        dob: '1988-08-22',
    },
    {
        id: 3,
        name: 'Sneha Reddy',
        email: 'sneha@example.com',
        phone: '+91 70000 00003',
        address: 'Hyderabad, Telangana',
        dob: '1992-03-10',
    },
];

export const MOCK_SCHEDULES = [
    {
        id: 1,
        doctorId: 1,
        doctorName: 'Dr. Sarah Johnson',
        title: 'Morning Consultation',
        date: '2025-11-25',
        time: '09:00',
        maxPatients: 10,
        bookedPatients: 7,
    },
    {
        id: 2,
        doctorId: 1,
        doctorName: 'Dr. Sarah Johnson',
        title: 'Evening Consultation',
        date: '2025-11-25',
        time: '16:00',
        maxPatients: 8,
        bookedPatients: 5,
    },
    {
        id: 3,
        doctorId: 2,
        doctorName: 'Dr. Michael Chen',
        title: 'Skin Checkup Session',
        date: '2025-11-26',
        time: '10:00',
        maxPatients: 12,
        bookedPatients: 9,
    },
];

export const MOCK_APPOINTMENTS = [
    {
        id: 1,
        patientId: 1,
        patientName: 'Aditya Kumrawat',
        doctorId: 1,
        doctorName: 'Dr. Sarah Johnson',
        scheduleId: 1,
        scheduleTitle: 'Morning Consultation',
        date: '2025-11-25',
        time: '09:00',
        queueNumber: 3,
        status: 'confirmed',
    },
    {
        id: 2,
        patientId: 2,
        patientName: 'Ravi Patel',
        doctorId: 1,
        doctorName: 'Dr. Sarah Johnson',
        scheduleId: 2,
        scheduleTitle: 'Evening Consultation',
        date: '2025-11-25',
        time: '16:00',
        queueNumber: 1,
        status: 'confirmed',
    },
    {
        id: 3,
        patientId: 3,
        patientName: 'Sneha Reddy',
        doctorId: 2,
        doctorName: 'Dr. Michael Chen',
        scheduleId: 3,
        scheduleTitle: 'Skin Checkup Session',
        date: '2025-11-26',
        time: '10:00',
        queueNumber: 5,
        status: 'pending',
    },
];

// Current logged-in doctor (for doctor dashboard)
export const CURRENT_DOCTOR = MOCK_DOCTORS[0]; // Dr. Sarah Johnson
