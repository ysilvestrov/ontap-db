import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
	selector: 'app-weight-editor',
	templateUrl: './weight-editor.component.html',
	styleUrls: ['./weight-editor.component.css']
})
export class WeightEditorComponent implements OnInit {
	get weight(): number {
		return this._weight;
	}

	@Input()
	set weight(value: number) {
		this._weight = value;
		this.weightForm.controls['weight'].setValue(value);
	}

	constructor() { }

	weightForm = new FormGroup({
		weight: new FormControl(''),
	});

	private _weight: number;
	@Output() weighted = new EventEmitter<number>();
	@Output() canceled = new EventEmitter<null>();

	ngOnInit() {
	}

	onSubmit() {
		this.weighted.emit(this.weightForm.controls['weight'].value);
	}

	onCanceled() {
		this.canceled.emit();
	}
}
