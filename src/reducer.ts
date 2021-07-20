import React from "react";
import * as immer from "immer";

export interface State {
  clickedLayer: { x: number; y: number; values: Array<SingleObject> };
  coordinateQuery: CoordinateQuery;
  searchText: { x: string; y: string; values: Array<SingleObject> }; //add new state
  textSearchQuery: TextQuery; //add new state
  isFetching: boolean; // Fetching results from API
  mapClustered: boolean;
  searchResults: Array<SingleObject>;
  selectedObject: SingleObject;
  zoomLevel: number;
  properties: { [key: string]: boolean };
}
export const initialState: State = {
  clickedLayer: undefined,
  coordinateQuery: undefined,
  searchText: undefined,
  textSearchQuery: undefined,
  isFetching: false,
  mapClustered: true,
  searchResults: [],
  selectedObject: undefined,
  zoomLevel: 8, //default leaflet zoom level
  properties: {},
};

export type Action =
  | {
      type: "clickLayer";
      value: { x: number; y: number; values: Array<SingleObject> };
    }
  | { type: "closeClickedLayer" }
  | { type: "coordinate_search_start"; value: CoordinateQuery }
  | { type: "reset" }
  | { type: "resetSelectedObject" }
  | { type: "search_error" } //text search error
  | { type: "search_start"; value: TextQuery } //text search start
  | { type: "search_success"; results: State["searchResults"] } //text search start
  | { type: "selectObject"; value: SingleObject }
  | { type: "setMapClustered"; value: boolean }
  | { type: "textSearch";
      value: { x: string; y: string; values: Array<SingleObject> };
    } //text search
  | { type: "zoomChange"; value: number }
  | { type: "resetProperties"; value: Array<string> }
  | { type: "setProperties"; value: { [key: string]: boolean } };// new case Mariam
// new case Mariam
export interface SingleObject {
  sub: string;
  geo: any;
  [key: string]: string;
 }

export interface CoordinateQuery {
  lat: string;
  lng: string;
}

export interface TextQuery {
  endpoint: string;
}

export const reducer: React.Reducer<State, Action> = immer.produce(
  (state: State, action: Action) => {
    console.log("%c " + action.type, "color: #ff00e6"); // action type. color
    switch (action.type) {
      case "coordinate_search_start":
        state.isFetching = true;
        state.coordinateQuery = action.value;
        state.searchResults = [];
        state.selectedObject = undefined;
        return state;
      case "search_start":
        state.isFetching = true;
        state.textSearchQuery = action.value;
        state.searchResults = [];
        state.selectedObject = undefined;
        return state;
      case "search_error":
        state.isFetching = false;
        return state;
      case "search_success":
        state.isFetching = false;
        state.searchResults = action.results;
        return state;
      case "reset":
        return initialState;
      case "setMapClustered":
        state.mapClustered = action.value;
        return state;
      case "selectObject":
        return state;
      case "resetSelectedObject":
        state.selectedObject = undefined;
        return state;
      case "clickLayer":
        state.clickedLayer = action.value;
        return state;
      case "closeClickedLayer":
        state.clickedLayer = undefined;
        return state;
      case "resetProperties":// new case Mariam
        state.properties = action.value.reduce(
          (a, b) => (["geo", "sub"].includes(b) ? a : { ...a, [b]: true }),
          {}
        );
        return state;
      case "setProperties":// new case Mariam
        state.properties = action.value;
        return state;
      default:
        return state;
      case "zoomChange":
        state.zoomLevel = action.value;
        if (state.zoomLevel < 20 && !state.mapClustered)
          state.mapClustered = true;
        if (state.zoomLevel>= 20 && state.mapClustered)
          state.mapClustered = false;
        console.log("zoomlevel = " + state.zoomLevel);
        return state;
    }
  }
);
