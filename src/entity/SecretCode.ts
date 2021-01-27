import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    OneToOne
} from "typeorm";
import { Length } from "class-validator";
import { MembersList } from "./MembersList";
import { User } from "./User";

@Entity()
export class SecretCode {
    @PrimaryColumn()
    email: string;

    @Column()
    code: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;
}
