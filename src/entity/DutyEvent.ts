import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn
} from "typeorm";
import { Member } from "./Member";

@Entity()
export class DutyEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: Date;

    @Column({ default: false })
    closed: Boolean;

    @OneToOne(() => Member)
    @JoinColumn()
    member: Member;
}
