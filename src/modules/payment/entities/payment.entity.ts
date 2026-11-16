import { Column, Entity, Unique } from 'typeorm';

@Entity({ name: 'tb_payment' })
@Unique(['service_order_id'])
export class User {
  @Column({ primary: true })
  orderId: string;

  @Column({ nullable: false })
  service_order_id: number;
}
