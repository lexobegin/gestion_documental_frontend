import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoUpdateComponent } from './auto-update.component';

describe('AutoUpdateComponent', () => {
  let component: AutoUpdateComponent;
  let fixture: ComponentFixture<AutoUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
