import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesOrganizationsDepartments } from './roles-organizations-departments';

describe('RolesOrganizationsDepartments', () => {
  let component: RolesOrganizationsDepartments;
  let fixture: ComponentFixture<RolesOrganizationsDepartments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesOrganizationsDepartments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesOrganizationsDepartments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
