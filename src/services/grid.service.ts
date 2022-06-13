export default class GridService {
	static myInstance:any = null;

	static getInstance() {
		if (this.myInstance === null) {
		  this.myInstance = new this();
		}
		return this.myInstance;
	  }

    // constructor() {}
  
      public setRowClickHandler = (grid: any, handler: Function) => {
        if (grid?.current?.instance!) {
            grid.current.instance.on('rowClick', (...args: any[]) => {
              const cellData = [];
              const cells = args[1].cells;
              for (let i = 0; i < cells.length; i++) {
                  cellData.push(cells[i].data);
              }
              handler(cellData);
            });
          } else {
              console.error('setRowClickHandler: grid.current.instance is undefined');
          }
      }

}