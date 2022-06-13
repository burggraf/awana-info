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

      public setClickHandler = (grid: any, handler: Function) => {
        if (grid?.current?.instance!) {
            grid.current.instance.on('cellClick', (...args: any[]) => {
                const columnData = args[1].data;
                const columnInfo = args[2];                
                const rowData = [];
                const cellsArray = args[3].cells;
                for (let i = 0; i < cellsArray.length; i++) {
                    rowData.push(cellsArray[i].data);
                }
                handler({columnData, columnInfo, rowData});
            });
          } else {
              console.error('setRowClickHandler: grid.current.instance is undefined');
          }
      }


}