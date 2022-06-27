import { Request } from "express";
import { courseRepository, userRepository } from "../repositories";
import { AssertsShape } from "yup/lib/object";
import { Course, User } from "../entities";
import {
  serializedAdminCoursesSchema,
  serializedCourseSchema,
  serializedStudentsCoursesSchema,
} from "../schemas";
import sendEmail from "./mailer.service";
import { countReset } from "console";

class CourseService {
  createCourse = async ({ validated }: Request): Promise<AssertsShape<any>> => {
    const course = await courseRepository.save(validated as Course);
    return await serializedCourseSchema.validate(course, {
      stripUnknown: true,
    });
  };

  readAllCourses = async ({ decoded }): Promise<AssertsShape<any>> => {
    let newList = [];
    const courses = await courseRepository.listAll();
    const loggedUser = await userRepository.retrieve({ id: decoded.id });
    if (loggedUser.isAdm) {
      for (const element of courses) {
        newList.push({
          id: element.id,
          courseName: element.courseName,
          duration: element.duration,
          students: await element.students,
        });
      }
      return await serializedAdminCoursesSchema.validate(newList, {
        stripUnknown: true,
      });
    }
    return await serializedStudentsCoursesSchema.validate(courses, {
      stripUnknown: true,
    });
  };

  updateCourse = async ({ validated, params }): Promise<AssertsShape<any>> => {
    const course = await courseRepository.update(params.id, {
      ...(validated as Course),
    });
    const updatedCourse = await courseRepository.retrieve({ id: params.id });
    return await serializedCourseSchema.validate(updatedCourse, {
      stripUnknown: true,
    });
  };
  subscripeCourse = async ({ decoded, params }: Request) => {
    const { id } = decoded;
    const course_id = params.id;

    const user = await userRepository.retrieve({ id: id });
    const course = await courseRepository.retrieve({ id: course_id });

    user.courses.push(course);
    userRepository.save(user);
    sendEmail(user.firstName, course.courseName, course.duration);

    return { message: "Email de inscrição enviado com sucesso." };
  };
}

export default new CourseService();
