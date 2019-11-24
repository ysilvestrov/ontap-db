import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';

@Component({
	selector: 'app-short-date',
	templateUrl: './short-date.component.html',
	styleUrls: ['./short-date.component.css']
})
export class ShortDateComponent {

	@Input() date: Date;
	@Input() direction = 'asc';

	constructor() { }

	yearDiff(date: Date) {
		return -1 * Math.floor(moment().diff(date, 'years'));
	}

}
