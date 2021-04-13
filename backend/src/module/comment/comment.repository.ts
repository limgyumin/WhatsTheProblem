import { EntityRepository, Repository } from 'typeorm';
import { Comment } from './comment.entity';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  findOneByIdx(idx: number): Promise<Comment> {
    return this.createQueryBuilder().where('idx = :idx', { idx }).getOne();
  }

  findAllByAnswerIdxOrderByCreatedAtASC(answerIdx: number): Promise<Comment[]> {
    return this.createQueryBuilder()
      .where('fk_answer_idx = :answerIdx', { answerIdx })
      .orderBy('created_at', 'ASC')
      .getMany();
  }

  findAllByPostIdxOrderByCreatedAtASC(postIdx: number): Promise<Comment[]> {
    return this.createQueryBuilder()
      .where('fk_post_idx = :postIdx', { postIdx })
      .orderBy('created_at', 'ASC')
      .getMany();
  }

  findAllWithUserByAnswerIdxOrderByCreatedAtASC(
    answerIdx: number,
  ): Promise<Comment[]> {
    return this.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.fk_answer_idx = :answerIdx', { answerIdx })
      .orderBy('comment.created_at', 'ASC')
      .getMany();
  }

  findAllWithUserByPostIdxOrderByCreatedAtASC(
    postIdx: number,
  ): Promise<Comment[]> {
    return this.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.fk_post_idx = :postIdx', { postIdx })
      .orderBy('comment.created_at', 'ASC')
      .getMany();
  }

  findAllAndCountByPostIdx(postIdx: number): Promise<number> {
    return this.createQueryBuilder()
      .where('fk_post_idx = :postIdx', { postIdx })
      .getCount();
  }
}
