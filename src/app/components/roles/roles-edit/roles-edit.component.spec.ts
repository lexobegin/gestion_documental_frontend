import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesEditComponent } from './roles-edit.component';

describe('RolesEditComponent', () => {
  let component: RolesEditComponent;
  let fixture: ComponentFixture<RolesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
