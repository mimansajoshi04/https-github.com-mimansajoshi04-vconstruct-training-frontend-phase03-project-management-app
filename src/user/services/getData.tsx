
import { getAllUsers } from "../../../database/model/user";
import { getProjectsByUserId } from "../../../database/model/project";

const getAllDataForUser = (db: IDBDatabase, id:number): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    let userData;
    let projectData;

    try {
      userData = await getAllUsers(db);
      if (userData) {
        projectData = await getProjectsByUserId(db,id);
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
        console.log("in else")
        projectData = await getProjectsByUserId(db,id);
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

export { getAllDataForUser };

