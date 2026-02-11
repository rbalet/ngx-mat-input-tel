import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDividerModule } from '@angular/material/divider'

import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatInputModule } from '@angular/material/input'
import { NgxMatInputTelComponent } from './ngx-mat-input-tel'

describe('NgxMatInputTelComponent', () => {
  let component: NgxMatInputTelComponent
  let fixture: ComponentFixture<NgxMatInputTelComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule,
        MatDividerModule,
        ReactiveFormsModule,
        NgxMatInputTelComponent,
      ],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMatInputTelComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
