import { defineStore } from 'pinia'


export const useGlobalStore = defineStore('global', {
    state: () => {
        return { 
            cite_depth: 1,
            meng_depth: 1,
            loc_model: 1,
            selected_book: {},
        }
    },
    actions: {
        update_cite_depth(v){
            this.cite_depth = v;
        },
        update_meng_depth(v){
            this.meng_depth = v;
        },
        update_loc_model(v){
            this.loc_model = v;
        },
        update_selected_book(v){
            this.selected_book = v;
        },
    }
})