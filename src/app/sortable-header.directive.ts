import {Directive, EventEmitter, HostBinding, HostListener, Input, Output} from '@angular/core';

export type SortDirection = 'asc' | 'desc' | '';
const rotate: {[key: string]: SortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };
export const compare = (v1, v2) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

export interface SortEvent {
	column: string;
	direction: SortDirection;
}

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: 'th[sortable]'
})
export class SortableHeaderDirective {
	@Input() sortable: string;
	@Input() direction: SortDirection = '';
	@Output() sort = new EventEmitter<SortEvent>();
	@HostBinding('class.asc') get asc() {return this.direction === 'asc'; }
	@HostBinding('class.desc') get desc() {return this.direction === 'desc'; }
	@HostListener('click')	rotate() {
		this.direction = rotate[this.direction];
		this.sort.emit({column: this.sortable, direction: this.direction});
	}
}
