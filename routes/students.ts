import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { CreateStudentDTO, UpdateStudentDTO } from "../src/types";

const prisma = new PrismaClient();
const router = new Hono();

router.get("/", async (c) => {
  try {
    const students = await prisma.student.findMany();
    return c.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return c.json("error", 500);
  }
});

router.get("/enriched", async (c) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        proctor: true,
        libraryMembership: true,
      },
    });
    return c.json(students);
  } catch (error) {
    console.error("Error fetching enriched students:", error);
    return c.json("error", 500);
  }
});

router.post("/", async (c) => {
  try {
    const body = (await c.req.json()) as CreateStudentDTO;
    const { name, dateOfBirth, aadharNumber } = body;

    const student = await prisma.student.create({
      data: {
        name,
        dateOfBirth: new Date(dateOfBirth),
        aadharNumber,
      },
    });

    return c.json(student, 201);
  } catch (error) {
    console.error("Error creating student:", error);
    return c.json(500);
  }
});

// PATCH /students/:studentId - Updates a student
router.patch("/:studentId", async (c) => {
  try {
    const studentId = c.req.param("studentId");
    const body = (await c.req.json()) as UpdateStudentDTO;

    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.aadharNumber) data.aadharNumber = body.aadharNumber;
    if (body.dateOfBirth) data.dateOfBirth = new Date(body.dateOfBirth);

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data,
    });

    return c.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    return c.json( 500);
  }
});

// DELETE /students/:studentId - Deletes a student
router.delete("/:studentId", async (c) => {
  try {
    const studentId = c.req.param("studentId");

    await prisma.student.delete({
      where: { id: studentId },
    });

    return c.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return c.json( 500);
  }
});


router.get("/:studentId/library-membership", async (c) => {
  try {
    const studentId = c.req.param("studentId");

    const membership = await prisma.libraryMembership.findUnique({
      where: { studentId },
    });

    if (!membership) {
      return c.json(
        { error: "Library membership not found for this student" },
        404
      );
    }

    return c.json(membership);
  } catch (error) {
    console.error("Error fetching library membership:", error);
    return c.json(500);
  }
});

router.post("/:studentId/library-membership", async (c) => {
  try {
    const studentId = c.req.param("studentId");
    const body = (await c.req.json()) as {
      issueDate: string;
      expiryDate: string;
    };

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }

    // Check if membership already exists
    const existingMembership = await prisma.libraryMembership.findUnique({
      where: { studentId },
    });

    if (existingMembership) {
      return c.json(
        { error: "Library membership already exists for this student" },
        400
      );
    }

    const membership = await prisma.libraryMembership.create({
      data: {
        studentId,
        issueDate: new Date(body.issueDate),
        expiryDate: new Date(body.expiryDate),
      },
    });

    return c.json(membership, 201);
  } catch (error) {
    console.error("Error creating library membership:", error);
    return c.json(500);
  }
});

router.patch("/:studentId/library-membership", async (c) => {
  try {
    const studentId = c.req.param("studentId");
    const body = (await c.req.json()) as {
      issueDate?: string;
      expiryDate?: string;
    };

    const data: any = {};
    if (body.issueDate) data.issueDate = new Date(body.issueDate);
    if (body.expiryDate) data.expiryDate = new Date(body.expiryDate);

    const updatedMembership = await prisma.libraryMembership.update({
      where: { studentId },
      data,
    });

    return c.json(updatedMembership);
  } catch (error) {
    console.error("Error updating library membership:", error);
    return c.json(500);
  }
});

router.delete("/:studentId/library-membership", async (c) => {
  try {
    const studentId = c.req.param("studentId");

    await prisma.libraryMembership.delete({
      where: { studentId },
    });

    return c.json({ message: "Library membership deleted successfully" });
  } catch (error) {

    console.error("Error deleting library membership:", error);
    return c.json(500);
  }
});

export default router;
