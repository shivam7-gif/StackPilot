'use client';
import { createProjectApi } from "@/apis/project";
import {useMutation} from "@tanstack/react-query";
export const useCreateProject = ()=>{
  const {mutateAsync , isPending , isSuccess , error} = useMutation({
    mutationFn : createProjectApi,
    onSuccess : (data)=>{
      console.log("Project created successfully",data);
    },
    onError : (error)=>{
      console.error("Error creating project",error);
    }
  });
  return {
    createProjectMutation : mutateAsync,
    isPending , 
    isSuccess , 
    error
  }
}