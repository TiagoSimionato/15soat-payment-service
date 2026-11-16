import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity({ name: 'tb_payment' })
@Unique(['service_order_id'])
export class Payment {
  @PrimaryColumn()
  orderId: string;

  @Column({ name: 'service_order_id' })
  serviceOrderId: number;
}
