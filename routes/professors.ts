import { Hono } from "hono";
import { PrismaClient, Seniority } from "@prisma/client";
import {
  CreateProfessorDTO,
  UpdateProfessorDTO,
  AssignProctorshipDTO,
} from "../src/types";

const prisma = new PrismaClient();
const router = new Hono();

router.get("/", async (c) => {
  try {
    const professors = await prisma.professor.findMany();
    return c.json(professors);
  } catch (error) {
    console.error("Error fetching professors:", error);
    return c.json(500);
  }
});

router.post("/", async (c) => {
  try {
    const body = (await c.req.json()) as CreateProfessorDTO;
    const { name, seniority, aadharNumber } = body;

    if (!Object.values(Seniority).includes(seniority)) {
      return c.json({ error: "Invalid seniority value" }, 400);
    }

    const professor = await prisma.professor.create({
      data: {
        name,
        seniority,
        aadharNumber,
      },
    });

    return c.json(professor, 201);
  } catch (error) {

    console.error("Error creating professor:", error);
    return c.json(500);
  }
});

router.patch("/:professorId", async (c) => {
  try {
    const professorId = c.req.param("professorId");
    const body = (await c.req.json()) as UpdateProfessorDTO;

    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.aadharNumber) data.aadharNumber = body.aadharNumber;
    if (body.seniority) {
      if (!Object.values(Seniority).includes(body.seniority)) {
        return c.json({ error: "Invalid seniority value" }, 400);
      }
      data.seniority = body.seniority;
    }

    const updatedProfessor = await prisma.professor.update({
      where: { id: professorId },
      data,
    });

    return c.json(updatedProfessor);
  } catch (error) {
    console.error("Error updating professor:", error);
    return c.json(500);
  }
});

router.delete("/:professorId", async (c) => {
  try {
    const professorId = c.req.param("professorId");

    await prisma.professor.delete({
      where: { id: professorId },
    });

    return c.json({ message: "Professor deleted successfully" });
  } catch (error) {

    console.error("Error deleting professor:", error);
    return c.json(500);
  }
});

router.get("/:professorId/proctorships", async (c) => {
  try {
    const professorId = c.req.param("professorId");

    const professor = await prisma.professor.findUnique({
      where: { id: professorId },
    });

    if (!professor) {
      return c.json({ error: "Professor not found" }, 404);
    }

    const students = await prisma.student.findMany({
      where: {
        proctorId: professorId,
      },
    });

    return c.json(students);
  } catch (error) {
    console.error("Error fetching proctorships:", error);
    return c.json( 500);
  }
});

router.post("/:professorId/proctorships", async (c) => {
  try {
    const professorId = c.req.param("professorId");
    const body = (await c.req.json()) as AssignProctorshipDTO;
    const { studentId } = body;

    const professor = await prisma.professor.findUnique({
      where: { id: professorId },
    });

    if (!professor) {
      return c.json({ error: "Professor not found" }, 404);
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        proctorId: professorId,
      },
      include: {
        proctor: true,
      },
    });

    return c.json(updatedStudent);
  } catch (error) {
    console.error("Error assigning proctorship:", error);
    return c.json(500);
  }
});

export default router;
