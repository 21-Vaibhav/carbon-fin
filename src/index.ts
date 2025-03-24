import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { PrismaClient } from "@prisma/client";
import studentRoutes from "../routes/students";
import professorRoutes from "../routes/professors";

const prisma = new PrismaClient();

const app = new Hono();



app.get("/", (c) => c.json({ message: "Welcome to College API" }));

app.route("/students", studentRoutes);
app.route("/professors", professorRoutes);

const PORT = 5000;
console.log(`Server is running on port ${PORT}`);

serve({
  fetch: app.fetch,
  port: parseInt(PORT.toString()),
});


