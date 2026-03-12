import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useUserHook } from "./useUserHook";
import { getAllData } from "../services/getData";
import type { UserType } from "../../database/model/user";
import type { ProjectType } from "../../database/model/project";
import type { ProjectDataStructure } from "../types";

interface DataType {
  allUsers: UserType[] | null;
  projectData: ProjectType[] | ProjectDataStructure | null;
  setAllUsers: Dispatch<SetStateAction<UserType[] | null>>;
  setProjectData: Dispatch<
    SetStateAction<ProjectType[] | ProjectDataStructure | null>
  >;
}

export const useDataForUser = (): DataType => {
  const { user } = useUserHook();
  const [allUsers, setAllUsers] = useState<UserType[] | null>(null);
  const [projectData, setProjectData] = useState<
    ProjectType[] | ProjectDataStructure | null
  >(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          let response = await getAllData(user);
          setAllUsers(response.userData ?? []);
          setProjectData(response.projectData);
        }
      } catch (error) {
        // handle error
      }
    };

    loadData();
  }, [user]);

  return { allUsers, projectData, setAllUsers, setProjectData };
};

export type { DataType };
