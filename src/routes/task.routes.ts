import cors from "cors";
import { Router } from "express";
import TaskRepo from "../repositories/taskRepository";
import { getCustomRepository, getRepository, ObjectID } from 'typeorm'
import ensureAutheticated from "../middlewares/ensureAutheticated";
import CreateTaskService from "../services/CreateTaskService";
import Task from "../models/Task";

const taskRouter = Router();
taskRouter.use(cors())
taskRouter.use(ensureAutheticated)

taskRouter.get("/", async ( req, res ) => {
    try {
        const tasksRepo = getCustomRepository(TaskRepo);
        const { id } = req.user;
        const { status }: any = req.query;
        const tasks = status ?
        await tasksRepo.find({ where: {
            user_id: id,
            status
        }, select: ["id", "name", "status", "subtasks", "created_at", "updated_at"]  })
        :
        await tasksRepo.find({ where: {
            user_id: id
        }, select: ["id", "name", "status", "subtasks", "created_at", "updated_at"] })
        const resume = tasksRepo.resume(tasks)

        return res.json({tasks, resume})

    } catch(err){
        console.log(err)
        return res.status(400).json()
    }
})

taskRouter.post("/", async ( req, res ) => {
    const { name, tagId } = req.body;
    const { id } = req.user;
    const createTask = new CreateTaskService;
    const task = await createTask.execute({
        name,
        id,
        tagId
    })

    return res.status(201).json(task)
})


taskRouter.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const taskRepo = getRepository(Task);

    // Tenta realizar a atualiziação dos dados
    const task = await taskRepo.update(id, data)
    return res.json(task);

})

taskRouter.delete("/:id", (req, res) => {
    const { id } = req.params;
    const taskRepo = getCustomRepository(TaskRepo)
    try {
        taskRepo.delete(id)
        return res.status(202).json()
    } catch (error) {
        return res.status(400).json({msg: error})
    }

})


export default taskRouter;