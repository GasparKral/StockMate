package com.stockmate.stockmate_backend.infrastructure.persistance.mapper;

import com.stockmate.stockmate_backend.application.dto.response.UserInfoDTO;
import com.stockmate.stockmate_backend.domain.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserInfoMapper {
    UserInfoDTO userToUserInfoDTO(User user);
}
