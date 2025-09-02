import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCreateComponent } from './auto-create.component';

describe('AutoCreateComponent', () => {
  let component: AutoCreateComponent;
  let fixture: ComponentFixture<AutoCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
