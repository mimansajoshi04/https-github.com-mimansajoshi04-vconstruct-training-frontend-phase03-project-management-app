import { getAllUsers, type UserType } from "../../database/model/user";
import {
  getProjectsByUserId,
  type ProjectType,
} from "../../database/model/project";
import { getAllProjects } from "../../database/model/project";
import type { ProjectDataStructure } from "../types";
import { USER_ROLES } from "../constants/app.constants";

interface AppData {
  userData?: UserType[];
  projectData: ProjectDataStructure | ProjectType[];
}

const getAllData = (user: UserType): Promise<AppData> => {
  return new Promise(async (resolve) => {
    try {
      let userData = await getAllUsers();
      let projectData =
        user.role === USER_ROLES.ADMIN
          ? await getAllProjects()
          : await getProjectsByUserId(user?.id ?? -1);

      resolve({
        userData: userData,
        projectData: projectData,
      });
    } catch (error) {
      // handle error
    }
  });
};

export { getAllData };
