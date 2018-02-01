import _ from 'lodash';

import { StateTemplates, TypeTemplates, TransitionTemplates, ModuleTemplates, StructureTemplates } from '../templates/Templates';

const initialState = [];


export default (state = initialState, action) => {
  let newState = null;

  switch (action.type) {
    case 'NEW_MODULE':
      // const Initial = {...StateTemplates.Initial, direct_transition: "Initial"};
      return [...state, ModuleTemplates.Blank]

    case 'EDIT_NODE':
      let path = action.data.path.join('.');

      let value = Object.values(action.data.update)[0]
      if(typeof value === 'object') {
        value = value.id;
      }
      newState = [...state];
      if(value) {
        _.set(newState, path, value);
      }
      else{
        _.unset(newState, path);
      }

      return [...newState]

    case 'ADD_STRUCTURE':
      newState = [...state];
      newState[action.data.currentModuleIndex].states = {...newState[action.data.currentModuleIndex].states, ...StructureTemplates[action.data.structureName]};
      return newState

    case 'ADD_TRANSITION':
      newState = [...state];

      let transitionMapping = {
        Conditional: 'conditional_transition',
        Distributed: 'distributed_transition',
        Direct: 'direct_transition',
        Complex: 'complex_transition',
      };
      let transitionName = transitionMapping[action.data.transitionType] || 'direct_transition';
      let paths = Object.values(transitionMapping);
      for (var pathIndex in paths) {
        delete newState[action.data.currentModuleIndex].states[action.data.nodeName.name][paths[pathIndex]];
      }
      newState[action.data.currentModuleIndex].states[action.data.nodeName.name][transitionName] = _.clone(TransitionTemplates[action.data.transitionType]);
      return newState

    case 'ADD_NODE':
      newState = [...state];
      const stateIndex = Object.keys(newState[action.data.currentModuleIndex].states).length;
      const NewState = {...StateTemplates.Simple, direct_transition: `State_${stateIndex}`};
      newState[action.data.currentModuleIndex].states = {...newState[action.data.currentModuleIndex].states, [`State_${stateIndex}`]:NewState};
      return [...newState]

    case 'RENAME_NODE':
      newState = [...state];
      let oldModule = newState[action.data.targetModuleIndex].states[action.data.targetNode.name];
      newState[action.data.targetModuleIndex].states[action.data.newName.name] = oldModule;
      delete newState[action.data.targetModuleIndex].states[action.data.targetNode.name];
      return newState;
    case 'EDIT_MODULE_NAME':
      newState = [...state];
      newState[action.data.targetModuleIndex].name = action.data.newName;
      return newState;
    case 'EDIT_MODULE_REMARKS':
      newState = [...state];
      newState[action.data.targetModuleIndex].remarks = [action.data.newRemarks]; // Need to split into rows for readability
      return newState;
    case 'CHANGE_STATE_TYPE':
      newState = [...state];
      let newType = action.data.newType.type.id;
      // This line is weird because we need to add the new fields, overwrite any shared fields, then overwrite the type fields
      // TODO figure out how to remove unused fields
      newState[action.data.targetModuleIndex].states[action.data.targetNode.name] =
        { ...StateTemplates[newType],
          ...newState[action.data.targetModuleIndex].states[action.data.targetNode.name],
          type: StateTemplates[newType].type
        };
      return newState
    default:
      return state;
  }
}