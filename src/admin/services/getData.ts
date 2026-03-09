import { getAllUsers } from "../../../database/model/user";
import { getAllProjects } from "../../../database/model/project";

const getAllDataForAdminUser = (): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    let userData;
    let projectData;
    try {
      userData = await getAllUsers();
      if (userData) {
        projectData = await getAllProjects();
        if (projectData) {
          resolve({
            userData: userData,
            projectData: projectData,
          });
        } else {
          resolve({
            userData: userData,
            projectData: {},
          });
        }
      } else {
        projectData = await getAllProjects();
        if (projectData) {
          resolve({
            userData: {},
            projectData: projectData,
          });
        } else {
          reject([]);
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

export { getAllDataForAdminUser };
