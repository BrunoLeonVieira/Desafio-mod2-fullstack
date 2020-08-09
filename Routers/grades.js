import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const router = express.Router();

//GET DATA OF GRADES FILE
router.get("/", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.filename));
    delete data.nextId;
    res.send(data);
    logger.info("GET /grades");
  } catch (error) {
    next(error);
  }
});

//GET DATA BY ID
router.get("/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.filename));

    const index = data.grades.findIndex((element) => {
      return element.id === parseInt(req.params.id);
    });

    if (index === -1) {
      throw new Error("Id not found");
    }

    res.send(data.grades[index]);
    logger.info("GET /grades/:id");
  } catch (error) {
    next(error);
  }
});

//INSERT GRADE IN GRADES.JSON FILE
router.post("/", async (req, res, next) => {
  try {
    let grades = req.body;

    //VALIDATE INPUT DATA
    if (
      !grades.student ||
      !grades.subject ||
      !grades.type ||
      grades.value === null
    ) {
      throw new Error("Student, subject, type and value is required!");
    }
    const data = JSON.parse(await readFile(global.filename));

    grades = {
      id: data.nextId++,
      student: grades.student,
      subject: grades.subject,
      type: grades.type,
      value: grades.value,
      timestamp: new Date(),
    };

    data.grades.push(grades);

    await writeFile(global.filename, JSON.stringify(data));
    logger.info(`POST /grades - ${JSON.stringify(grades)}`);
    res.send(grades);
  } catch (error) {
    next(error);
  }
});

//UPTADE REGISTER
router.put("/", async (req, res, next) => {
  try {
    let grades = req.body;

    //VALIDATE INPUT DATA
    if (
      !grades.id ||
      !grades.student ||
      !grades.subject ||
      !grades.type ||
      grades.value === null
    ) {
      throw new Error("ID, Student, subject, type and value is required!");
    }

    const data = JSON.parse(await readFile(filename));

    const index = data.grades.findIndex((element) => {
      return element.id === grades.id;
    });

    if (index === -1) {
      throw new Error("id not found");
    }

    data.grades[index].student = grades.student;
    data.grades[index].subject = grades.subject;
    data.grades[index].type = grades.type;
    data.grades[index].value = grades.value;

    await writeFile(filename, JSON.stringify(data));
    logger.info(`PUT /grades - ${JSON.stringify(grades)}`);
    res.send(grades);
  } catch (error) {
    next(error);
  }
});

//DELETE REGISTER BY ID
router.delete("/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(filename));

    const index = data.grades.findIndex((element) => {
      return element.id === parseInt(req.params.id);
    });

    if (index === -1) {
      throw new Error("Id not found");
    }

    data.grades = data.grades.filter((element) => {
      return element.id !== parseInt(req.params.id);
    });

    await writeFile(filename, JSON.stringify(data));

    logger.info(`DELETE /grades/:id`);
    res.end();
  } catch (error) {
    next(error);
  }
});

//SUM ALL GRADES BY STUDENT
router.post("/sumGrades", async (req, res, next) => {
  try {
    const param = req.body;

    //VALIDATE INPUT DATA
    if (!param.student || !param.subject) {
      throw new Error("Student and subject is required!");
    }

    const data = JSON.parse(await readFile(filename));

    const mappead = data.grades.filter((element) => {
      if (
        element.student === param.student &&
        element.subject === param.subject
      )
        return true;

      return false;
    });

    if (mappead.length === 0) {
      throw new Error("Not data found");
    }

    const val = mappead.reduce((accumulator, current) => {
      return accumulator + current.value;
    }, 0);

    logger.info("POST /grades/sumGrades");
    res.send({ value: val });
  } catch (error) {
    next(error);
  }
});

//GET MEDIA BY SUBJECT AND TYPE
router.post("/media", async (req, res, next) => {
  try {
    const param = req.body;

    //VALIDATE INPUT DATA
    if (!param.subject || !param.type) {
      throw new Error("Subject and type is required!");
    }

    const data = JSON.parse(await readFile(filename));

    const mappead = data.grades.filter((element) => {
      if (element.subject === param.subject && element.type === param.type)
        return true;

      return false;
    });

    const val = mappead.reduce((accumulator, current) => {
      return accumulator + current.value;
    }, 0);

    logger.info(
      `POST /grades/media -${JSON.stringify(param)} : ${val / mappead.length}`
    );
    res.send({ media: val / mappead.length });
  } catch (error) {
    next(error);
  }
});

router.post("/topTree", async (req, res, next) => {
  try {
    const param = req.body;

    //VALIDATE INPUT DATA
    if (!param.subject || !param.type) {
      throw new Error("Subject and type is required!");
    }

    const data = JSON.parse(await readFile(filename));

    //FILTER BY SUBJECT AND TYPE
    let mappead = data.grades.filter((element) => {
      if (element.subject === param.subject && element.type === param.type)
        return true;

      return false;
    });

    //ORDER BY VALUE
    mappead.sort((a, b) => {
      return b.value - a.value;
    });

    mappead = mappead.slice(0, 3);

    logger.info(`POST /grades/topTree`);
    res.send(JSON.stringify(mappead));
  } catch (error) {
    next(error);
  }
});

//ERROR TREATMENT
router.use((error, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} - ${error.stack}`);
  res.status(400).send({ error: error.message });
});

export default router;
