import { Pipe, PipeTransform } from '@angular/core';
import {IServe, ITap} from './ontap.models';

@Pipe({
  name: 'sortByTap'
})
export class SortByTapPipe implements PipeTransform {

  isNumber(value: string | number): boolean {
    return !isNaN(Number(value.toString()));
  }

  transform(array: Array<ITap>, args: string): Array<ITap> {
    array.sort((a: ITap, b: ITap) => {
      if (this.isNumber(a.number) && this.isNumber(b.number)) {
        if (Number(a.number) < Number(b.number)) {
          return -1;
        } else if (Number(a.number) > Number(b.number)) {
          return 1;
        } else {
          return 0;
        }
      } else if (a.number < b.number) {
        return -1;
      } else if (a.number > b.number) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}
