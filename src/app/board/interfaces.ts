
export declare interface Task extends FirebaseItem {
  text: string;
  
  /**
   * Key reference to parent list
   */
  list: string;
  
  /**
   * For ordering tasks
   */
  priority: number;
}

export declare interface List extends FirebaseItem {
  title: string;
  priority: number;
}

interface FirebaseItem {
  $key?: string;
}
