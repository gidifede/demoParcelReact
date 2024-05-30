import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export function addToStorage(value: any){

  var ldvs = localStorage.getItem("ldvs")

  if(ldvs != null){
    var ldv_list = JSON.parse(ldvs)
    ldv_list.push(value)
    localStorage.setItem("ldvs", JSON.stringify(ldv_list))
  }else{
    localStorage.setItem("ldvs", JSON.stringify([value]))
  }

}

export function getFromStorage(){

  const ldvs = localStorage.getItem("ldvs")
  if (ldvs != null){
    return JSON.parse(ldvs)
  }
  return []

}