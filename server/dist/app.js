"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const auth_1 = require("./auth");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//Auth routes (public)
app.post('/auth/register', auth_1.register);
app.post('/auth/login', auth_1.login);
//Protect all routes below this line
app.use(auth_1.authenticate);
// --- Drivers ---
app.get('/drivers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const drivers = yield prisma.driver.findMany({
        orderBy: { created_at: 'desc' }
    });
    res.json(drivers);
}));
app.post('/drivers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, license } = req.body;
    const driver = yield prisma.driver.create({
        data: { name, email, phone, license }
    });
    res.json(driver);
}));
//Update a drivers details or status by ID
app.patch('/drivers/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { name, email, phone, license, status, inducted, induction_date } = req.body;
    const driver = yield prisma.driver.update({
        where: { id },
        data: { name, email, phone, license, status, inducted, induction_date }
    });
    res.json(driver);
}));
//Delete a driver by ID
app.delete('/drivers/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    yield prisma.driver.delete({ where: { id } });
    res.json({ success: true });
}));
// --- Customers ---
app.get('/customers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customers = yield prisma.customer.findMany({
        orderBy: { created_at: 'desc' }
    });
    res.json(customers);
}));
app.post('/customers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, address } = req.body;
    const customer = yield prisma.customer.create({
        data: { name, email, phone, address }
    });
    res.json(customer);
}));
// Update a customer's details by ID
app.patch('/customers/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { name, email, phone, address } = req.body;
    const customer = yield prisma.customer.update({
        where: { id },
        data: { name, email, phone, address }
    });
    res.json(customer);
}));
// Delete a customer by ID
app.delete('/customers/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    yield prisma.customer.delete({ where: { id } });
    res.json({ success: true });
}));
// --- Jobs ---
app.get('/jobs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobs = yield prisma.job.findMany({
        include: { driver: true, customer: true },
        orderBy: { created_at: 'desc' }
    });
    res.json(jobs);
}));
app.post('/jobs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driver_id, customer_id, origin, destination, commodity } = req.body;
    const job = yield prisma.job.create({
        data: { driver_id, customer_id, origin, destination, commodity },
        include: { driver: true, customer: true }
    });
    res.json(job);
}));
app.patch('/jobs/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const job = yield prisma.job.update({
        where: { id },
        data: { status },
        include: { driver: true, customer: true }
    });
    //Fire webhook to Make.com when job status changes
    fetch('https://hook.eu1.make.com/lk3epm4vcheyhgxsay06ku6gu02zs82c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            job_id: job.id,
            status: job.status,
            driver: job.driver.name,
            customer: job.customer.name,
            origin: job.origin,
            destination: job.destination,
            updated_at: new Date().toISOString()
        })
    }).catch(err => console.error('Webhook failed:', err));
    res.json(job);
}));
app.delete('/jobs/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    yield prisma.job.delete({ where: { id } });
    res.json({ success: true });
}));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
exports.default = app;
